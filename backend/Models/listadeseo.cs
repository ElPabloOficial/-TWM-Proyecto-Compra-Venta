using System;
using System.Collections.Generic;

namespace TiendaOnline.API.Models;

public partial class listadeseo
{
    public int id { get; set; }

    public string nombrelista { get; set; } = null!;

    public string? descripcion { get; set; }

    public bool visibilidad { get; set; }

    public virtual ICollection<crear1> crear1s { get; set; } = new List<crear1>();

    public virtual ICollection<crear2> crear2s { get; set; } = new List<crear2>();
}
