using System;
using System.Collections.Generic;

namespace TiendaOnline.API.Models;

public partial class cotizacion
{
    public int id { get; set; }

    public DateOnly fechacreacion { get; set; }

    public string estado { get; set; } = null!;

    public DateOnly? fechaultimaactualizacion { get; set; }

    public virtual ICollection<solicitar1> solicitar1s { get; set; } = new List<solicitar1>();

    public virtual ICollection<solicitar2> solicitar2s { get; set; } = new List<solicitar2>();
}
