using System;
using System.Collections.Generic;

namespace TiendaOnline.API.Models;

public partial class producto
{
    public int id { get; set; }

    public string nombre { get; set; } = null!;

    public bool restriccionedad { get; set; }

    public string caracteristicas { get; set; } = null!;

    public int? id_oferta { get; set; }

    public DateOnly? fechainicio { get; set; }

    public DateOnly? fechafin { get; set; }

    public string? imagen { get; set; }

    public virtual ICollection<almacenar> almacenars { get; set; } = new List<almacenar>();

    public virtual ICollection<crear1> crear1s { get; set; } = new List<crear1>();

    public virtual ICollection<crear3> crear3s { get; set; } = new List<crear3>();

    public virtual ICollection<escribir1> escribir1s { get; set; } = new List<escribir1>();

    public virtual ICollection<generar1> generar1s { get; set; } = new List<generar1>();

    public virtual ICollection<generar3> generar3s { get; set; } = new List<generar3>();

    public virtual ICollection<hacer1> hacer1s { get; set; } = new List<hacer1>();

    public virtual ofertum? id_ofertaNavigation { get; set; }

    public virtual ICollection<ofrecer1> ofrecer1s { get; set; } = new List<ofrecer1>();

    public virtual ICollection<solicitar1> solicitar1s { get; set; } = new List<solicitar1>();

    public virtual ICollection<categorium> id_categoria { get; set; } = new List<categorium>();
}
